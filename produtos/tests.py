from rest_framework.test import APITestCase

from .models import Produto

VALIDO = {"nome": "Cabo USB", "preco": "20.00", "marca": "Ugreen", "estoque": 10}


class CrudTests(APITestCase):
    def setUp(self):
        self.produto = Produto.objects.create(nome="Mouse", preco="50.00", marca="Logitech", estoque=5)

    def test_listar_e_detalhar(self):
        self.assertEqual(self.client.get("/api/produtos/").status_code, 200)
        r = self.client.get(f"/api/produtos/{self.produto.id}/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(sorted(r.json()), ["descricao", "estoque", "id", "marca", "nome", "preco"])
        self.assertEqual(self.client.get("/api/produtos/999/").status_code, 404)

    def test_criar_atualizar_e_excluir(self):
        r = self.client.post("/api/produtos/", VALIDO, format="json")
        self.assertEqual(r.status_code, 201)
        pk = r.json()["id"]
        r = self.client.put(f"/api/produtos/{pk}/", {**VALIDO, "nome": "Cabo USB-C", "estoque": 7}, format="json")
        self.assertEqual((r.status_code, r.json()["nome"], r.json()["estoque"]), (200, "Cabo USB-C", 7))
        self.assertEqual(self.client.delete(f"/api/produtos/{pk}/").status_code, 204)
        self.assertEqual(self.client.get(f"/api/produtos/{pk}/").status_code, 404)

    def test_documentacao(self):
        self.assertEqual(self.client.get("/api/schema/").status_code, 200)
        self.assertEqual(self.client.get("/api/docs/").status_code, 200)


class ValidacaoTests(APITestCase):
    def enviar(self, **dados):
        return self.client.post("/api/produtos/", {**VALIDO, **dados}, format="json")

    def test_nome_curto_e_preco_zero(self):
        r = self.enviar(nome="A", preco=0)
        self.assertEqual(r.status_code, 400)
        self.assertIn("nome", r.json())
        self.assertIn("preco", r.json())

    def test_nome_so_com_espacos(self):
        self.assertEqual(self.enviar(nome="   ").status_code, 400)

    def test_preco_negativo(self):
        self.assertEqual(self.enviar(preco="-1.00").status_code, 400)

    def test_nome_e_limpo_antes_de_salvar(self):
        r = self.enviar(nome="  Cabo USB  ")
        self.assertEqual((r.status_code, r.json()["nome"]), (201, "Cabo USB"))

    def test_put_invalido(self):
        p = Produto.objects.create(nome="Mouse", preco="50.00", marca="Logitech", estoque=5)
        r = self.client.put(f"/api/produtos/{p.id}/", {**VALIDO, "nome": "A"}, format="json")
        self.assertEqual(r.status_code, 400)


class MarcaTests(APITestCase):
    def enviar(self, **dados):
        return self.client.post("/api/produtos/", {**VALIDO, **dados}, format="json")

    def test_obrigatoria(self):
        dados = {k: v for k, v in VALIDO.items() if k != "marca"}
        r = self.client.post("/api/produtos/", dados, format="json")
        self.assertEqual((r.status_code, "marca" in r.json()), (400, True))

    def test_curta_vazia_e_longa(self):
        self.assertEqual(self.enviar(marca="A").status_code, 400)
        self.assertEqual(self.enviar(marca="   ").status_code, 400)
        self.assertEqual(self.enviar(marca="x" * 51).status_code, 400)
        self.assertEqual(self.enviar(marca="x" * 50).status_code, 201)

    def test_e_limpa_antes_de_salvar(self):
        self.assertEqual(self.enviar(marca="  Dell  ").json()["marca"], "Dell")

    def test_filtro_exato_sem_diferenciar_maiusculas(self):
        Produto.objects.create(nome="Notebook", preco="3000.00", marca="Dell", estoque=3)
        Produto.objects.create(nome="Monitor", preco="900.00", marca="Dell Outlet", estoque=3)
        Produto.objects.create(nome="Mouse", preco="50.00", marca="Logitech", estoque=3)
        r = self.client.get("/api/produtos/?marca=dell").json()["results"]
        self.assertEqual([p["nome"] for p in r], ["Notebook"])

    def test_ordenacao_e_busca(self):
        Produto.objects.create(nome="Notebook", preco="3000.00", marca="Dell", estoque=3)
        Produto.objects.create(nome="Mouse", preco="50.00", marca="Logitech", estoque=3)
        r = self.client.get("/api/produtos/?ordering=-marca").json()["results"]
        self.assertEqual([p["marca"] for p in r], ["Logitech", "Dell"])
        r = self.client.get("/api/produtos/?search=dell").json()["results"]
        self.assertEqual([p["nome"] for p in r], ["Notebook"])


class EstoqueTests(APITestCase):
    def enviar(self, estoque):
        return self.client.post("/api/produtos/", {**VALIDO, "estoque": estoque}, format="json")

    def test_zero_e_valido(self):
        self.assertEqual(self.enviar(0).status_code, 201)

    def test_invalidos(self):
        for invalido in (-1, "dez", 5.5, None, True):
            with self.subTest(estoque=invalido):
                self.assertEqual(self.enviar(invalido).status_code, 400)

    def test_obrigatorio(self):
        dados = {k: v for k, v in VALIDO.items() if k != "estoque"}
        self.assertEqual(self.client.post("/api/produtos/", dados, format="json").status_code, 400)

    def test_filtros_de_intervalo(self):
        for nome, estoque in (("A1", 5), ("B2", 20), ("C3", 50)):
            Produto.objects.create(nome=nome, preco="10.00", marca="Marca", estoque=estoque)

        def nomes(consulta):
            return sorted(p["nome"] for p in self.client.get(f"/api/produtos/?{consulta}").json()["results"])

        self.assertEqual(nomes("estoque_minimo=20"), ["B2", "C3"])
        self.assertEqual(nomes("estoque_maximo=20"), ["A1", "B2"])
        self.assertEqual(nomes("estoque_minimo=10&estoque_maximo=30"), ["B2"])

    def test_ordenacao_e_fora_da_busca(self):
        Produto.objects.create(nome="Mouse", preco="10.00", marca="Marca", estoque=5)
        Produto.objects.create(nome="Cabo", preco="10.00", marca="Marca", estoque=500)
        r = self.client.get("/api/produtos/?ordering=-estoque").json()["results"]
        self.assertEqual([p["estoque"] for p in r], [500, 5])
        self.assertEqual(self.client.get("/api/produtos/?search=500").json()["results"], [])


class DescricaoTests(APITestCase):
    def enviar(self, **dados):
        return self.client.post("/api/produtos/", {**VALIDO, **dados}, format="json")

    def test_opcional(self):
        self.assertEqual(self.enviar().status_code, 201)
        self.assertEqual(self.enviar(descricao=None).status_code, 201)
        self.assertEqual(self.enviar(descricao="").status_code, 201)

    def test_limite_de_500_caracteres(self):
        self.assertEqual(self.enviar(descricao="x" * 500).status_code, 201)
        self.assertEqual(self.enviar(descricao="x" * 501).status_code, 400)

    def test_busca_e_ordenacao(self):
        Produto.objects.create(nome="Cabo", preco="10.00", marca="Marca", estoque=1, descricao="Cabo USB-C rápido")
        Produto.objects.create(nome="Mouse", preco="10.00", marca="Marca", estoque=1, descricao=None)
        r = self.client.get("/api/produtos/?search=usb-c").json()["results"]
        self.assertEqual([p["nome"] for p in r], ["Cabo"])
        self.assertEqual(self.client.get("/api/produtos/?ordering=descricao").status_code, 200)


class FiltroTests(APITestCase):
    def setUp(self):
        for nome, preco in (("Cabo", "20.00"), ("Mouse", "80.00"), ("Teclado", "250.00"), ("Monitor", "1200.00")):
            Produto.objects.create(nome=nome, preco=preco, marca="Marca", estoque=1)

    def nomes(self, consulta):
        r = self.client.get(f"/api/produtos/?{consulta}")
        self.assertEqual(r.status_code, 200)
        return sorted(p["nome"] for p in r.json()["results"])

    def test_preco_minimo(self):
        self.assertEqual(self.nomes("preco_minimo=250"), ["Monitor", "Teclado"])

    def test_preco_maximo(self):
        self.assertEqual(self.nomes("preco_maximo=80"), ["Cabo", "Mouse"])

    def test_intervalo(self):
        self.assertEqual(self.nomes("preco_minimo=50&preco_maximo=300"), ["Mouse", "Teclado"])

    def test_sem_resultados(self):
        self.assertEqual(self.nomes("preco_minimo=5000"), [])

    def test_valor_nao_numerico(self):
        self.assertEqual(self.client.get("/api/produtos/?preco_minimo=abc").status_code, 400)
        self.assertEqual(self.client.get("/api/produtos/?estoque_minimo=abc").status_code, 400)


class OrdenacaoEBuscaTests(APITestCase):
    def setUp(self):
        for nome, preco in (("Teclado USB", "250.00"), ("Mouse USB", "80.00"), ("Cabo HDMI", "20.00"), ("Monitor", "1200.00")):
            Produto.objects.create(nome=nome, preco=preco, marca="Marca", estoque=1)

    def nomes(self, consulta):
        r = self.client.get(f"/api/produtos/?{consulta}")
        self.assertEqual(r.status_code, 200)
        return [p["nome"] for p in r.json()["results"]]

    def test_ordem_padrao_por_id(self):
        self.assertEqual(self.nomes(""), ["Teclado USB", "Mouse USB", "Cabo HDMI", "Monitor"])

    def test_ordenar_por_nome(self):
        self.assertEqual(self.nomes("ordering=nome"), ["Cabo HDMI", "Monitor", "Mouse USB", "Teclado USB"])
        self.assertEqual(self.nomes("ordering=-nome")[0], "Teclado USB")

    def test_ordenar_por_preco(self):
        self.assertEqual(self.nomes("ordering=preco")[0], "Cabo HDMI")
        self.assertEqual(self.nomes("ordering=-preco")[0], "Monitor")

    def test_busca_parcial_sem_diferenciar_maiusculas(self):
        self.assertEqual(sorted(self.nomes("search=usb")), ["Mouse USB", "Teclado USB"])
        self.assertEqual(self.nomes("search=MONI"), ["Monitor"])

    def test_busca_sem_resultados(self):
        self.assertEqual(self.nomes("search=inexistente"), [])

    def test_combinar_filtro_busca_e_ordenacao(self):
        self.assertEqual(self.nomes("preco_minimo=100&search=usb&ordering=nome"), ["Teclado USB"])


class PaginacaoTests(APITestCase):
    def setUp(self):
        Produto.objects.bulk_create(
            Produto(nome=f"Produto {i:02d}", preco=f"{i}.00", marca="Marca", estoque=i) for i in range(1, 26)
        )

    def get(self, consulta=""):
        return self.client.get(f"/api/produtos/?{consulta}")

    def test_formato_e_padrao(self):
        r = self.get().json()
        self.assertEqual((r["page"], r["page_size"], r["total_pages"], len(r["results"])), (1, 10, 3, 10))

    def test_segunda_pagina_com_page_size(self):
        r = self.get("page=2&page_size=20").json()
        self.assertEqual((r["page"], r["page_size"], r["total_pages"], len(r["results"])), (2, 20, 2, 5))

    def test_pagina_alem_do_limite_devolve_lista_vazia(self):
        r = self.get("page=999")
        self.assertEqual((r.status_code, r.json()["results"]), (200, []))

    def test_page_size_acima_de_100(self):
        self.assertEqual(self.get("page_size=101").status_code, 400)
        self.assertEqual(self.get("page_size=100").status_code, 200)

    def test_page_invalida(self):
        self.assertEqual(self.get("page=0").status_code, 400)
        self.assertEqual(self.get("page=abc").status_code, 400)

    def test_combina_com_busca_e_ordenacao(self):
        r = self.get("search=produto&ordering=-preco&page=1&page_size=5").json()
        self.assertEqual([p["nome"] for p in r["results"]][:2], ["Produto 25", "Produto 24"])
        self.assertEqual(r["total_pages"], 5)

    def test_filtro_e_aplicado_antes_da_paginacao(self):
        r = self.get("preco_minimo=21&page_size=2").json()
        self.assertEqual((r["total_pages"], len(r["results"])), (3, 2))

    def test_lista_vazia_tem_zero_paginas(self):
        r = self.get("search=inexistente").json()
        self.assertEqual((r["total_pages"], r["results"]), (0, []))
