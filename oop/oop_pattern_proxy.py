class BankAccount:
    def __init__(self,owner=0,balance=None):
        self.owner = owner
        self.balance = balance

    def deposit(self,amount):
        if amout > 0:
            self.balance += 1

    def withdraw(self,amount):
        if 0 < amount <= self.balance:
            self.balance -= amount
        else:
            print('invalid amount. try again')

    def get_balance(self):
        return self.balance

