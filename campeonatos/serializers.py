from rest_framework import serializers

from .models import Campeonato, Jogador, Partida, Time


class CampeonatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campeonato
        fields = "__all__"


class TimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Time
        fields = "__all__"


class JogadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jogador
        fields = "__all__"


class PartidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partida
        fields = "__all__"
