use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_camel_case_types)]
pub struct ticket_item {
    pub line_item_product_name: String,
    pub line_item_quantity: f32,
    pub line_item_price: f32,
    pub line_item_total: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_camel_case_types)]
pub struct ticket {
    pub id: String,
    pub created_at: String,
    pub pesos_paid: f32,
    pub dollars_paid: f32,
    pub cards_paid: f32,
    pub others_paid: f32,
    pub total_due: f32,
    pub change: f32,
    pub ticket_items: Vec<ticket_item>,
}
