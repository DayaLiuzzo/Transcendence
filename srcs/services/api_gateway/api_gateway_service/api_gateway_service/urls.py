"""
URL configuration for api_gateway_service project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import logging
import requests

from django.contrib import admin
from django.http import JsonResponse
from django.urls import path
from django.urls import re_path
from django.views import View

from api_gateway_app import views

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)

def route_to_service(request, service_name, extra_path=''):
    """Route API requests to the appropriate microservice."""
    service_map = {
        "users": "http://users:8000",
        "game": "http://game:8001",
        "auth": "http://auth:8003",
        "friends": "http://friends:8004",
        "rooms": "http://rooms:8005",
    }
    logger.debug(f"------------------ON EST LA TU CONNAIS--------------")

    if service_name in service_map:
        # Construire l'URL cible
        service_url = service_map[service_name]
        url = f"{service_url}/api/{service_name}/{extra_path.lstrip('/')}"  # Ajouter le sous-chemin extra_path si présent
        logger.debug(f"*********************************************")

        try:
            # Transférer la requête au microservice
            headers = {
                "Content-Type": request.headers.get("Content-Type", ""),
                "Authorization": request.headers.get("Authorization", ""),
            }
            logger.debug(f"headers de la requête: {headers}")

            response = requests.request(
                method=request.method,
                url=url,
                headers=headers,
                data=request.body,
            )
            logger.debug(f"Réponse du service {service_name}: {response.status_code} - {response.text[:10000]}")
            return JsonResponse(response.json(), status=response.status_code, safe=False)
        except requests.exceptions.RequestException as e:
            return JsonResponse(data="grrrr", status=response.status_code, safe=False)
            # return JsonResponse({"error": f"grrrr", "details": str(e)}, status=response.status_code, safe=False)

    return JsonResponse({"error": "Service not found"}, status=404)

urlpatterns = [
    path('admin/', admin.site.urls),  # Administration panel
    re_path(r'^api/(?P<service_name>\w+)(?P<extra_path>/?.*)$', route_to_service),
]
