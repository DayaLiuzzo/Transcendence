from django.utils import timezone
from django.conf import settings
from datetime import datetime
from datetime import timedelta
import requests
import jwt

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError

from auth_app.models import Token
from .serializers import createServiceToken

def send_request(url:str, method:str, body={}, headers={}) -> int:
    token = getServiceToken()
    headers.update({'Authorization': f'Bearer {token}'})
    req_methods = {
            'post':requests.post,
            'delete':requests.delete,
            'update':requests.put,
            'patch':requests.patch,
            }
    response = req_methods[method](url, json=body ,headers=headers)
    print(f'Request at url {url} return {response.status_code}')
    return response.status_code

def send_delete_requests(urls:list, body={}, headers={}) -> bool :
    for url in urls:
        if send_request(url=url, method='delete', body=body, headers=headers) not in  [204, 304]:
            return False
    return True

def send_update_requests(urls:list, body={}, headers={}) -> bool:
    for url in urls:
        if send_request(url=url, method='patch', body=body, headers=headers) != 200:
            return False
    return True

def send_create_requests(urls:list, body={}, headers={}) -> bool:
    successefull_elements = []
    for url in urls:
        if send_request(url=url, method='post', body=body, headers=headers) != 201:
            break
        else:
            successefull_elements.append(url)
    if len(urls) != len(successefull_elements):
        return False
        for url in successefull_elements:
            rollback_url = url.replace('create', 'delete') + body['username'] + '/' 
            send_request(url=rollback_url, method='delete', headers=headers)
    return True

def getServiceToken():
    auth_token = Token.objects.get(service_name='auth')

    try:
        decoded_token = jwt.decode(
            auth_token.token,
            settings.SIMPLE_JWT['VERIFYING_KEY'],
            settings.SIMPLE_JWT['ALGORITHM']
        )
        return auth_token.token
    except jwt.ExpiredSignatureError:
        raise ValueError("Token Expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid Token")



