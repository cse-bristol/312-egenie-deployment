# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-10-06 15:56
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import django_extensions.db.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('sd_store', '0001_initial'),
        ('hubs', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Deployment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, verbose_name='created')),
                ('modified', django_extensions.db.fields.ModificationDateTimeField(auto_now=True, verbose_name='modified')),
                ('client_name', models.CharField(max_length=255)),
                ('address_line_one', models.CharField(max_length=255)),
                ('post_code', models.CharField(max_length=255)),
                ('notes', models.TextField(blank=True, null=True)),
                ('photo', models.ImageField(blank=True, null=True, upload_to='deployment_photos')),
                ('gas_pence_per_kwh', models.IntegerField(default=0)),
                ('elec_pence_per_kwh', models.IntegerField(default=0)),
                ('hub', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='hubs.Hub')),
                ('pairs', models.ManyToManyField(to='sd_store.SensorChannelPair')),
            ],
            options={
                'ordering': ('-modified', '-created'),
                'get_latest_by': 'modified',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='DeploymentState',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, verbose_name='created')),
                ('modified', django_extensions.db.fields.ModificationDateTimeField(auto_now=True, verbose_name='modified')),
                ('end_date', models.DateTimeField(null=True)),
                ('deployment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='deployment_states', to='deployments.Deployment')),
            ],
            options={
                'ordering': ('-modified', '-created'),
                'get_latest_by': 'modified',
                'abstract': False,
            },
        ),
    ]
