from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Partida


class PartidaFilter(filters.FilterSet):
    time = filters.NumberFilter(method="filtrar_time", help_text="Partidas em que o time joga (mandante ou visitante)")
    data_de = filters.DateTimeFilter(field_name="data_hora", lookup_expr="gte")
    data_ate = filters.DateTimeFilter(field_name="data_hora", lookup_expr="lte")

    class Meta:
        model = Partida
        fields = ("campeonato", "status")

    def filtrar_time(self, queryset, name, value):
        return queryset.filter(Q(mandante=value) | Q(visitante=value))
