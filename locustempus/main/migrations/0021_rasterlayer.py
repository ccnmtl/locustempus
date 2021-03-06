# Generated by Django 2.2.18 on 2021-02-18 19:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0020_auto_20210205_1658'),
    ]

    operations = [
        migrations.CreateModel(
            name='RasterLayer',
            fields=[
                ('layer_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='main.Layer')),
                ('url', models.CharField(max_length=512)),
            ],
            bases=('main.layer',),
        ),
    ]
