# auth_app/management/commands/create_microservices.py

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from auth_app.models import Service, Token
from auth_app.serializers import createServiceToken
import os

class Command(BaseCommand):
    help = 'Create microservice users and tokens in bulk'

    def handle(self, *args, **kwargs):
        microservices = [
            {'service_name': 'auth', 'password': os.getenv('AUTH_PASSWORD')},
            {'service_name': 'users', 'password': os.getenv('USERS_PASSWORD')},
        ]
        
        services_to_create = []
        
        for microservice in microservices:
            password = make_password(microservice['password'])
            services_to_create.append(Service(service_name=microservice['service_name'], password=password))
        
        Service.objects.bulk_create(services_to_create)
        
        for service in Service.objects.filter(service_name__in=[m['service_name'] for m in microservices]):
            token = createServiceToken(service)
            Token.objects.create(service_name=service.service_name, token=token)

        self.stdout.write(self.style.SUCCESS('Microservices and tokens have been created successfully.'))
