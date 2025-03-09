use axum::Router;

mod auth;
mod file;

pub fn routes() -> Router {
    Router::new()
        .nest("/auth", auth::routes())
        .nest("/file", file::routes())
}
