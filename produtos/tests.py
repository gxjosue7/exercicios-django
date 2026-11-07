from rest_framework.test import APITestCase

from .models import Produto


class CrudTests(APITestCase):
    def setUp(self):
        self.produto = Produto.objects.create(nome="Mouse", preco="50.00")

    def test_listar_e_detalhar(self):
        self.assertEqual(self.client.get("/api/produtos/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/produtos/{self.produto.id}/").status_code, 200)
        self.assertEqual(self.client.get("/api/produtos/999/").status_code, 404)

    def test_criar_atualizar_e_excluir(self):
        r = self.client.post("/api/produtos/", {"nome": "Cabo USB", "preco": "20.00"}, format="json")
        self.assertEqual(r.status_code, 201)
        pk = r.json()["id"]
        r = self.client.put(f"/api/produtos/{pk}/", {"nome": "Cabo USB-C", "preco": "25.00"}, format="json")
        self.assertEqual((r.status_code, r.json()["nome"]), (200, "Cabo USB-C"))
        self.assertEqual(self.client.delete(f"/api/produtos/{pk}/").status_code, 204)
        self.assertEqual(self.client.get(f"/api/produtos/{pk}/").status_code, 404)

    def test_documentacao(self):
        self.assertEqual(self.client.get("/api/schema/").status_code, 200)
        self.assertEqual(self.client.get("/api/docs/").status_code, 200)


class FiltroTests(APITestCase):
    def setUp(self):
        for nome, preco in (("Cabo", "20.00"), ("Mouse", "80.00"), ("Teclado", "250.00"), ("Monitor", "1200.00")):
            Produto.objects.create(nome=nome, preco=preco)

    def nomes(self, consulta):
        r = self.client.get(f"/api/produtos/?{consulta}")
        self.assertEqual(r.status_code, 200)
        return sorted(p["nome"] for p in r.json())

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


class ValidacaoTests(APITestCase):
    def enviar(self, **dados):
        return self.client.post("/api/produtos/", dados, format="json")

    def test_nome_curto_e_preco_zero(self):
        r = self.enviar(nome="A", preco=0)
        self.assertEqual(r.status_code, 400)
        self.assertIn("nome", r.json())
        self.assertIn("preco", r.json())

    def test_nome_so_com_espacos(self):
        self.assertEqual(self.enviar(nome="   ", preco="10.00").status_code, 400)

    def test_preco_negativo(self):
        self.assertEqual(self.enviar(nome="Cabo", preco="-1.00").status_code, 400)

    def test_nome_e_limpo_antes_de_salvar(self):
        r = self.enviar(nome="  Cabo USB  ", preco="20.00")
        self.assertEqual((r.status_code, r.json()["nome"]), (201, "Cabo USB"))

    def test_put_invalido(self):
        p = Produto.objects.create(nome="Mouse", preco="50.00")
        r = self.client.put(f"/api/produtos/{p.id}/", {"nome": "A", "preco": "10.00"}, format="json")
        self.assertEqual(r.status_code, 400)
