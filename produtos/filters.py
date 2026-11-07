from django_filters import rest_framework as filters

from .models import Produto


class ProdutoFilter(filters.FilterSet):
    preco_minimo = filters.NumberFilter(field_name="preco", lookup_expr="gte")
    preco_maximo = filters.NumberFilter(field_name="preco", lookup_expr="lte")
    marca = filters.CharFilter(field_name="marca", lookup_expr="iexact")
    estoque_minimo = filters.NumberFilter(field_name="estoque", lookup_expr="gte")
    estoque_maximo = filters.NumberFilter(field_name="estoque", lookup_expr="lte")

    class Meta:
        model = Produto
        fields = (
            "preco_minimo",
            "preco_maximo",
            "marca",
            "estoque_minimo",
            "estoque_maximo",
        )
