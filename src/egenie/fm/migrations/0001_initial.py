# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-11-02 21:19
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FMMessage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author', models.TextField()),
                ('message', models.TextField()),
                ('subject', models.CharField(max_length=128)),
            ],
        ),
    ]
