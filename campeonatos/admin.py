from django.contrib import admin

from .models import Campeonato, Jogador, Partida, Time


@admin.register(Campeonato)
class CampeonatoAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "modalidade", "status", "max_times")
    list_filter = ("status",)
    search_fields = ("nome", "modalidade")


@admin.register(Time)
class TimeAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "sigla", "campeonato")
    list_filter = ("campeonato",)
    search_fields = ("nome", "sigla")


@admin.register(Jogador)
class JogadorAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "numero_camisa", "posicao", "time")
    list_filter = ("time",)
    search_fields = ("nome",)


@admin.register(Partida)
class PartidaAdmin(admin.ModelAdmin):
    list_display = ("id", "mandante", "visitante", "data_hora", "status", "gols_mandante", "gols_visitante")
    list_filter = ("status", "campeonato")
