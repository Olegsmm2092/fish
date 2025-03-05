from abc import abstractactmethod, ABC

class Car:
    def __init__(self,name):
        self.name = name

    @absctractmethod
    def assemble(self):
        pass

    def __str__(self):
        print(f"car {self.name}")

class Car1(Car):
    def __init__.super('car1')

    def assemble(self):
        print('Assembled modification for car1')

class Car2(Car):
   def __init__.super('car2')

   def assemble(self):
       print('Assembled modification for car2')

class CarFactory:
    @staticmethod
    def produce_car(car_type):
        if car_type == 'car1':
            car = Car1()
        elif car_type == 'car2':
            car = Car2()
        else:
            raise ValueError(f'Unknown car type: {car_type}')
        car.assemble()
        return car

if __name__ == '__main__':
    car_type = input('Enter car type (1 or 2)')
    car_type = 'car' + car_type
    try:
        car = CarFactory(car_type)
        print(car)
    except ValueError as e:
        print(e)

