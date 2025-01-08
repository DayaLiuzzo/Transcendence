import requests
from django.conf import settings
from rest_framework.exceptions import APIException


def fetch_service_token():
    service_token_endpoint = settings.MICROSERVICE_CLIENT["INTERNAL_TOKEN_ENDPOINT"]
    service_name = settings.MICROSERVICE_CLIENT["SERVICE_NAME"]
    service_password = settings.MICROSERVICE_CLIENT["SERVICE_PASSWORD"]

    response = requests.post(
        service_token_endpoint,
        data={
            "service_name": service_name,
            "password": service_password
        },
        verify=False
    )

    if response.status_code != 200:
        raise TokenFetchError(detail=f"Unable to fetch token. Auth service returned {response.status_code}.",
        status_code=response.status_code)

class TokenFetchError(APIException):
    status_code = 503
    default_detail = 'Failed to fetch the service token.'
    default_code = 'token_fetch_failed'
    http://users:8000