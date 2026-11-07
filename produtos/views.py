from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.viewsets import ModelViewSet

from .filters import ProdutoFilter
from .models import Produto
from .serializers import ProdutoSerializer


class ProdutoViewSet(ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_class = ProdutoFilter
    ordering_fields = ("nome", "preco", "marca", "estoque", "descricao")
    ordering = ("id",)
    search_fields = ("nome", "marca", "descricao")
