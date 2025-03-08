use axum::response::IntoResponse;
use axum::routing::get;
use axum::Router;
use dotenv::dotenv;
use std::env;
use std::net::SocketAddr;
use tokio::net::TcpListener;

mod routes;

async fn health_check() -> impl IntoResponse {
    "I'm probably fine"
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let app = Router::new()
        .route("/health", get(health_check))
        .nest("/api", routes::routes());

    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr: SocketAddr = format!("0.0.0.0:{}", port).parse().unwrap();
    let listener = TcpListener::bind(addr).await.unwrap();
    println!("🚀 SafeXchange backend running on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
