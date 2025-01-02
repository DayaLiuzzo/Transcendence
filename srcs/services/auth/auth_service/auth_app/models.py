from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from datetime import datetime, timedelta

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)

    def __str__(self):
        return self.title
    
class CustomUser(AbstractUser):
    last_log = models.DateTimeField(default=now)
    @property
    def is_authenticated(self):
        return True
    
class Service(models.Model):
    service_name = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)

class Token(models.Model):
    service_name = models.CharField(max_length=255)
    token = models.TextField()