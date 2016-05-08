from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class UserPortfolio(models.Model):
    user = models.ForeignKey(User)
    portfolio = models.TextField(blank=True, null=True)