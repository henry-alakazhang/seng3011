from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class UserPortfolio(models.Model):
    user = models.ForeignKey(User)
    portfolio = models.TextField(blank=True, null=True)

class UserProfileExtras(models.Model):
    user = models.OneToOneField(User)
    file_key = models.CharField(max_length=12)

class UserSavedNews(models.Model):
    user = models.ForeignKey(User)
    title = models.TextField(blank=True, null=True)
    body = models.TextField(blank=True, null=True)
    sentiment = models.TextField(blank=True, null=True)
    timestamp = models.CharField(max_length=26)
    tags = models.TextField(blank=True, null=True)

class UserSavedSearch(models.Model):
    user = models.ForeignKey(User)