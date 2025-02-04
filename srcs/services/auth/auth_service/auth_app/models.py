from datetime import datetime
from datetime import timedelta

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

import pyotp


class CustomUser(AbstractUser):
    last_log = models.DateTimeField(default=now)
    two_factor_enabled = models.BooleanField(default=False)
    otp_secret = models.CharField(max_length=32, default=pyotp.random_base32, blank=True, null=True)
    @property
    def is_authenticated(self):
        return True
    
class Service(models.Model):
    service_name = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)

class Token(models.Model):
    service_name = models.CharField(max_length=255)
    token = models.TextField()