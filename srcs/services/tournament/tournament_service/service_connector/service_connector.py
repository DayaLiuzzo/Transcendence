import requests
import logging
from django.conf import settings
from service_connector.exceptions import MicroserviceError
from service_connector.models import Token

class MicroserviceClient:
    def __init__(self):
        self.service_name = settings.SERVICE_CONNECTOR_SETTINGS['SERVICE_NAME']
        self.service_password = settings.SERVICE_CONNECTOR_SETTINGS['SERVICE_PASSWORD']
        self.token_url = settings.SERVICE_CONNECTOR_SETTINGS['INTERNAL_TOKEN_ENDPOINT']

    def send_internal_request(self, url:str, method:str, data={}, headers={}):
        token = self.get_service_token()
        headers = {
            "Authorization": f"Bearer {token}"
        }
        req_methods = {
        'get':requests.get,
        'post':requests.post,
        'delete':requests.delete,
        'update':requests.put,
        'patch':requests.patch,
        }
        response = req_methods[method](url, json=data ,headers=headers)
        return response

    def get_new_service_token(self):
        body = {
            'service_name': self.service_name,
            'password': self.service_password,
        }
        response = requests.post(self.token_url, data=body)
        if response.status_code != 200:
            raise MicroserviceError(response.status_code, "Failed fetching token from auth", response.text)
        token = response.json().get('token')
        return token
    
    def get_service_token(self):
        try:
            token = Token.objects.get(service_name=self.service_name)
        except Token.DoesNotExist:
            token = self.get_new_service_token()
        return token


