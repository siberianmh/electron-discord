use actix_web::{get, middleware, post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::io;
use uwuifier::uwuify_str_sse;

#[derive(Serialize, Deserialize)]
struct Response {
    status: i32,
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct UwufObject {
    message: String,
}

#[get("/status")]
pub async fn status() -> impl Responder {
    HttpResponse::Ok().json(Response {
        status: 200,
        message: "Pong".to_string(),
    })
}

#[post("/uwuf")]
async fn echo(body: web::Json<UwufObject>) -> impl Responder {
    let message = &body.0.message.to_owned();
    let smessage = &message[..];
    let res = uwuify_str_sse(&smessage[..]);

    HttpResponse::Ok().body(res)
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .service(status)
            .service(echo)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
