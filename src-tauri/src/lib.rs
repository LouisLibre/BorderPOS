use tauri::{
    menu::{AboutMetadata, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    Emitter, Manager,
};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_fs::FsExt;
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_sql::{Builder, Migration, MigrationKind};
use serde::{Serialize};
use std::error::Error;
use std::time::Duration;
use rusb;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Desde Rust!", name)
}

#[derive(Serialize)]
struct UsbDevice {
    vid: u16,
    pid: u16,
    manufacturer: String,
    product: String,
}

#[tauri::command]
fn get_printers() -> Result<Vec<UsbDevice>, String> {
    let timeout = Duration::from_millis(1000);
    let mut devices_info = Vec::new();

    for device in rusb::devices().map_err(|e| e.to_string())?.iter() {
        let device_desc = match device.device_descriptor() {
            Ok(desc) => desc,
            Err(e) => {
                eprintln!(
                    "Bus {:03} Device {:03}: Could not get device descriptor: {}",
                    device.bus_number(),
                    device.address(),
                    e
                );
                continue;
            }
        };

        let mut manufacturer = String::from("<none>");
        let mut product = String::from("<none>");

        if let Ok(handle) = device.open() {
            match handle.read_languages(timeout) {
                Ok(languages) if !languages.is_empty() => {
                    if let Some(idx) = device_desc.manufacturer_string_index() {
                        if idx > 0 {
                            manufacturer = handle
                                .read_string_descriptor_ascii(idx)
                                .unwrap_or_else(|e| format!("<read error: {:?}>", e));
                        }
                    }
                    if let Some(idx) = device_desc.product_string_index() {
                        if idx > 0 {
                            product = handle
                                .read_string_descriptor_ascii(idx)
                                .unwrap_or_else(|e| format!("<read error: {:?}>", e));
                        }
                    }
                }
                Ok(_) => {
                    manufacturer = String::from("<no languages reported>");
                    product = String::from("<no languages reported>");
                }
                Err(e) => {
                    let err_msg = format!("<lang read error: {:?}>", e);
                    manufacturer = err_msg.clone();
                    product = err_msg;
                }
            }
        } else {
            let err_msg = String::from("<could not open device>");
            manufacturer = err_msg.clone();
            product = err_msg;
        }

        devices_info.push(UsbDevice {
            vid: device_desc.vendor_id(),
            pid: device_desc.product_id(),
            manufacturer: manufacturer.trim().to_string(),
            product: product.trim().to_string(),
        });
    }
    Ok(devices_info)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // 0) Print app_dir to console
            println!("App dir: {:?}", app.path().app_data_dir());
            // Grab a handle to the main application
            let custom_quit = MenuItemBuilder::new("Quit This App")
                .id("my-custom-quit") // internal ID for on_menu_event matching
                .accelerator("CmdOrCtrl+Q") // override default so it no longer auto-quits
                .build(app)?;

            // 2) Create a menu item to open the DB folder
            let show_db_folder = MenuItemBuilder::new("Show DB Folder")
                .id("show-db-folder") // internal ID for on_menu_event matching
                .build(app)?;

            let reload_app = MenuItemBuilder::new("Reload")
                .id("reload-app")
                .accelerator("CmdOrCtrl+R") // Optional: adds a keyboard shortcut
                .build(app)?;

            let import_csv = MenuItemBuilder::new("Import CSV Products")
                .id("import-csv")
                .build(app)?;

            let app_submenu = SubmenuBuilder::new(app, "App")
                .about(Some(AboutMetadata {
                    ..Default::default()
                }))
                .separator()
                .services()
                .separator()
                .hide()
                .hide_others()
                .separator()
                // Add our custom quit item last
                .item(&show_db_folder)
                .item(&reload_app) // New "Reload" item
                .item(&import_csv)  // New menu item
                .item(&custom_quit)
                .build()?;

            let menu = MenuBuilder::new(app)
                .items(&[
                    &app_submenu,
                    // ... references to any other submenus ...
                ])
                .build()?;

            // Attach the menu to the application
            app.set_menu(menu)?;

            app.on_menu_event(move |app_handle, event| {
                // If "Settings" was clicked:
                if event.id() == custom_quit.id() {
                    // Instead of quitting immediately, emit a custom event
                    // so the front-end can handle cleanup before final exit
                    let _ = app_handle.emit("trigger-cleanup", ());
                }

                if event.id() == show_db_folder.id() {
                    let db_folder = app_handle.path().app_data_dir();
                    if let Ok(path) = db_folder {
                        let path_str = path.to_string_lossy().to_string();
                        let _ = app_handle.opener().open_path(path_str, None::<&str>);
                    }
                    println!("Show DB Folder clicked");
                }

                if event.id() == reload_app.id() {
                    // Reload the app window - Tauri v2 method
                    for window in app_handle.webview_windows().values() {
                        let _ = window.eval("window.location.reload()");
                    }
                }

                if event.id() == import_csv.id() {
                  let app_handle_clone = app_handle.clone();
                  app_handle.dialog()
                      .file()
                      .add_filter("CSV Files", &["csv"])
                      .pick_file(move |file_path| {
                          if let Some(path) = file_path {
                              // Read the file content
                              match app_handle_clone.fs().read_to_string(path.clone()) {
                                  Ok(csv_content) => {
                                      // Emit the CSV content to the frontend
                                      let _ = app_handle_clone.emit("import-csv-selected", csv_content);
                                      println!("CSV file selected: {:?}", path);
                                  }
                                  Err(e) => {
                                      eprintln!("Failed to read CSV file: {}", e);
                                      let _ = app_handle_clone.emit("import-csv-error", "Failed to read CSV file");
                                  }
                              }
                          } else {
                              println!("No CSV file selected");
                          }
                      });
                  }

            });

            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:pos_demo.db",
                    vec![Migration {
                        version: 1,
                        description: "schema migration",
                        sql: include_str!("../database/migrations/1_schema.sql"),
                        kind: MigrationKind::Up,
                    }],
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![get_printers])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
