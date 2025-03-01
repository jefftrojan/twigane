from setuptools import setup, find_packages

setup(
    name="twigane-backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "pydantic",
        "pydantic-settings"
    ]
)