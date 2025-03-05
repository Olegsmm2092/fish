class Printer:
    def __init__(self,name):
        self.name = name
        self.queue = []
    
    def add_print_job(self,print_job):
        self.queue.append(print_job)

    def print_all(self):
        if not self.queue:
            print('No print job in the queue')
            return
        for job in self.queue:
            print('Printing:')
            print(job.title, job.pages)
        self.queue.clear() # reset

    def get_queue_size(self):
        return len(self.queue)

class PrintJob:
    def __init__(self,title,pages):
        self.title = title
        self.pages = pages

if __name__ == "__main__":
    office_printer = Printer('Office Printer')
    job1 = PrintJob('Monthly Report', 10)
    job2 = PrintJob("Project Proposal", 20)
    job3 = PrintJob('Meeting Note', 2)
    office_printer.add_print_job(job1)
    office_printer.add_print_job(job2)
    office_printer.add_print_job(job3)

    office_printer.print_all()

    print(office_printer.get_queue_size())
                
