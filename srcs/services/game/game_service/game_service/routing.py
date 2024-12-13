from channels.auth import AuthenticationMiddleware
from channels.routing import ProtocolTypeRouter, URLRouter
import game_app.routing

application = ProtocolTypeRouter({
	'websocket' : AuthenticationMiddlewareStack(
		URLRouter(
			game_app.routing.websocket_urlpatterns
		)
	)
})
