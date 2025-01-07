import requests
# from django.conf import settings
# from rest_framework.exceptions import APIException


# def fetch_service_token():
#     service_token_endpoint = settings.MICROSERVICE_CLIENT["INTERNAL_TOKEN_ENDPOINT"],
#     service_name = settings.MICROSERVICE_CLIENT["SERVICE_NAME"]
#     service_password = settings.MICROSERVICE_CLIENT["SERVICE_PASSWORD"]

#     response = requests.post(
#         service_token_endpoint,
#         data={
#             "service_name": service_name,
#             "password": service_password
#         }
#     )

#     if response.status_code != 200:
#         raise 

# class TokenFetchError(APIException):

    