use axum::{response::IntoResponse, routing::post, Router};

async fn login() -> impl IntoResponse {
    "It's login route"
}

pub fn routes() -> Router {
    Router::new().route("/login", post(login))
}
