import requests
from django.conf import settings
from rest_framework.exceptions import APIException
from microservice_client.models import Token
import os

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
    if response.status_code == 200:
        token = response.json().get('token')
        if token:
            Token.objects.update_or_create(
                service_name=service_name,
                defaults={
                    'token':token,
                }
            )
            return token
        else:
            raise TokenFetchError(detail="Token not found in response.")
    else:
         raise TokenFetchError(detail=f"Unable to fetch token. Auth service returned {response.status_code}.", status_code=response.status_code)

def send_microservice_request(url: str, method: str, body=None, headers=None) -> int:
    service_name = settings.MICROSERVICE_CLIENT["SERVICE_NAME"]
    token_instance = Token.objects.filter(service_name=service_name).first()
    if not token_instance:
        token = fetch_service_token() 
    else:
        token = token_instance.token

    if headers is None:
        headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req_methods = {
        'get': requests.get,
        'post': requests.post,
        'put': requests.put,
        'patch': requests.patch,
        'delete': requests.delete,
    }
    if method.lower() not in req_methods:
        raise ValueError(f"Unsupported HTTP method: {method}")
    response = req_methods[method.lower()](url, json=body, headers=headers)
    print(f'Request to {url} with method {method} returned status code {response.status_code}')
    return response.status_code


class TokenFetchError(APIException):
    status_code = 503
    default_detail = 'Failed to fetch the service token.'
    default_code = 'token_fetch_failed'

