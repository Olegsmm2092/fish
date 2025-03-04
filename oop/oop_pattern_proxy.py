class BankAccount:
    def __init__(self,owner,balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self,amount):
        if amount > 0:
            self.balance += amount

    def withdraw(self,amount):
        if 0 < amount <= self.balance:
            self.balance -= amount
        else:
            print('invalid amount. try again')

    def get_balance(self):
        return self.balance

class ProxyBankAccount:
    def __init__(self,owner,balance=0):
        self.bank_account = BankAccount(owner, balance)

    def deposit(self,amount):
        self.bank_account.deposit(amount)
    
    def withdraw(self,amount):
        self.bank_account.withdraw(amount)

    def get_balance(self):
       return self.bank_account.get_balance()

proxy = ProxyBankAccount("John Doe", 1000)
proxy.deposit(500)
proxy.withdraw(200)
print(f"Current balance: {proxy.get_balance()}")
    
