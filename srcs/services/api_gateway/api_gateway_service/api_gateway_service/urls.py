import logging
import requests

from django.contrib import admin
from django.http import HttpResponse
from django.http import JsonResponse
from django.urls import path
from django.urls import re_path
from django.views import View

from api_gateway_app import views
from api_gateway_app.views import api_service_running

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    )

logger = logging.getLogger(__name__)

def route_to_service(request, service_name, extra_path=''):
    """Route API requests to the appropriate microservice."""
    service_map = {
        "users": "http://users:8443",
        "game": "http://game:8443",
        "auth": "http://auth:8443",
        "rooms": "http://rooms:8443",
        "avatar": "http://avatar:8443",
        "tournament": "http://tournament:8443",
    }
    # logger.debug(f"------------------ON EST LA TU CONNAIS--------------")

    if service_name in service_map:
        service_url = service_map[service_name]
        url = f"{service_url}/api/{service_name}/{extra_path.lstrip('/')}"  # Ajouter le sous-chemin extra_path si présent
        # logger.debug(f"*********************************************")

        try:
            headers = {
                "Content-Type": request.headers.get("Content-Type", ""),
                "Authorization": request.headers.get("Authorization", ""),
            }
            # logger.debug(f"headers de la requête: {headers}")

            response = requests.request(
                method=request.method,
                url=url,
                headers=headers,
                data=request.body,
            )
            logger.debug(f"Réponse du service {service_name}: {response.status_code} - {response.text[:10000]}")
            if (response.status_code == 204):
                return(HttpResponse(status=204))
            return JsonResponse(response.json(), status=response.status_code, safe=False)
        except requests.exceptions.RequestException as e:
            return JsonResponse({"details": str(e)}, status=response.status_code, safe=False)

    return JsonResponse({"error": "Service not found"}, status=404)

urlpatterns = [
    path('admin/', admin.site.urls),  
    path('api/api_gateway/', views.api_service_running, name='api_gateway'),
    re_path(r'^api/(?P<service_name>\w+)(?P<extra_path>/?.*)$', route_to_service),
]
