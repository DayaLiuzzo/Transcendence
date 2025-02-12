from django.db import models


class Token(models.Model):
    service_name = models.CharField(max_length=255)
    token = models.TextField()