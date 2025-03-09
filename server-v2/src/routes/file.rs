use axum::{
    response::IntoResponse,
    routing::{get, post},
    Router,
};

async fn upload_file() -> impl IntoResponse {
    "Upload file route"
}

async fn download_file() -> impl IntoResponse {
    "Download file route"
}

pub fn routes() -> Router {
    Router::new()
        .route("/upload", post(upload_file))
        .route("/download", get(download_file))
}
