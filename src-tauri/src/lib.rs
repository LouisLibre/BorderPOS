use tauri::{menu::{AboutMetadata, MenuBuilder, MenuItemBuilder, SubmenuBuilder}, Emitter, Manager};
use tauri_plugin_sql::{Builder, Migration, MigrationKind};
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Desde Rust!", name)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    tauri::Builder::default()
        .setup(|app| {
            // 0) Print app_dir to console
            println!("App dir: {:?}", app.path().app_data_dir());
            // Grab a handle to the main application
            let custom_quit = MenuItemBuilder::new("Quit This App")
                .id("my-custom-quit")         // internal ID for on_menu_event matching
                .accelerator("CmdOrCtrl+Q")   // override default so it no longer auto-quits
                .build(app)?;
            
            // 2) Create a menu item to open the DB folder
            let show_db_folder = MenuItemBuilder::new("Show DB Folder")
              .id("show-db-folder")            // internal ID for on_menu_event matching
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
                    vec![
                        Migration {
                            version: 1,
                            description: "schema migration",
                            sql: include_str!("../database/migrations/1_schema.sql"),
                            kind: MigrationKind::Up,
                        }
                    ])
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
