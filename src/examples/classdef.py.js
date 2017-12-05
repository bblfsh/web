export const python_example_2 = `class Animal:
    def __init__(self):
        self._a = 1
        b = 2

    def method(self, arg1):
        pass

    @property
    def a():
        return self._a

    @a.setter
    def a(newa):
        self._a = newa

a = Animal()
a.b = 3
a.b.c.d.e.f.g = 6
a.method(5)
`;
