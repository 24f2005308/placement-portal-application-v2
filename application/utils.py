from jinja2 import Template

def format_report(template_file, data):
    """
    Reads an HTML file and processes it using Jinja2 directly.
    """
    with open(template_file, 'r') as file:
        template = Template(file.read())
    return template.render(data=data)