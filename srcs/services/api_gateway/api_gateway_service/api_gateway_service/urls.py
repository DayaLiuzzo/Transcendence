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
from django.contrib import admin
from django.urls import path, re_path
from api_gateway_app import views
# from api_gateway_app.views import GetCSRFTokenView
from django.http import JsonResponse
import requests
import logging
from django.views import View

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
                # "X-CSRFToken": request.headers.get("X-CSRFToken", ""),
            }
            logger.debug(f"headers de la requête: {headers}")
        
            # cookies = {
            #     'csrftoken': request.COOKIES.get('csrftoken'),
            # }

            # logger.debug(f"Cookies de la requête: {cookies}")

            response = requests.request(
                method=request.method,
                url=url,
                headers=headers,
                # cookies=cookies,
                data=request.body,
            )
            logger.debug(f"Réponse du service {service_name}: {response.status_code} - {response.text[:10000]}")
            return JsonResponse(response.json(), status=response.status_code, safe=False)
        except requests.exceptions.RequestException as e:
            return JsonResponse(
                {"error": f"Service {service_name} is unavailable", "details": str(e)},
                status=503,
            )

    return JsonResponse({"error": "Service not found"}, status=404)

urlpatterns = [
    path('admin/', admin.site.urls),  # Administration panel
    re_path(r'^api/(?P<service_name>\w+)(?P<extra_path>/?.*)$', route_to_service),
]
