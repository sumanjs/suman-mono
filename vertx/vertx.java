package vertx;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.sql.SQLRowStream;
import io.vertx.ext.sync.Sync;
import io.vertx.ext.web.Router;
import io.vertx.ext.asyncsql.PostgreSQLClient;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.web.RoutingContext;
import io.vertx.core.Future;
import io.vertx.ext.web.handler.BodyHandler;

public class TestVerticle extends AbstractVerticle {
  
  @Override
  public void start(Future<Void> f) throws Exception {
    
    super.start();
    
    Vertx vertx = Vertx.vertx();
    
    Router router = Router.router(vertx);
    
    router.get("/").handler((req) -> {
      System.out.println("Got something");
// We crash
      throw new RuntimeException();
    });
    
    vertx.createHttpServer()
      .requestHandler(router)
      .listen(8080);
    
  }
  
}
