import pytest

from app.service import Service


@pytest.fixture
def idx(cfg):
    return Service(cfg).index


@pytest.mark.parametrize("q,esperado", [
    ("¿Dónde entrego mi documentación de inscripción?", "servicios-escolares"),
    ("necesito mi kardex", "servicios-escolares"),
    ("como pido una beca", "becas"),
    ("contraseña del wifi", "soporte-ti"),
    ("prestamo de libros", "biblioteca"),
    ("captura de calificaciones", "calificaciones-profesores"),
    ("hay elevador", "apoyo-psicopedagogico"),
])
def test_top1(idx, q, esperado):
    assert idx.search(q, "todos")[0].entry.id == esperado


def test_perfil_prioriza_audiencia(idx):
    prof = idx.search("alta contratacion", "profesor")
    assert prof[0].entry.id == "alta-profesores"


def test_sin_terminos_no_devuelve_nada(idx):
    assert idx.search("que de la el", "todos") == []


def test_fuera_de_alcance_baja_relevancia(cfg):
    s = Service(cfg)
    hits = s.index.search("cuanto cuesta un boleto de avion a Paris", "todos")
    assert not s._relevant(hits)
