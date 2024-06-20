# morning-compass-nextjs

## **_We all do the necessary tasks, there are is no need to divide the team into frontend and backend_**

## MOTTO

It's not rocket science. It may be hard but that's just some code.
Definitely easier than...

$$
f(x) = (y!)^{x} \int_{-\infty}^{\infty} \sum_{a=0}^{\infty} x^{a \pi e i} dx \\
$$

The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than \*right\* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!

## 1 A complete guide to the project

### 1.1 Naming conventions

#### Directories

- kebab-case: directories

#### JS/TS/TSX

- camelCase: functions, methods, variables, files (non-component-files)
- PascalCase: components, component-files

#### Rust

- PascalCase: types, traits, Enums, type parameters
- snake_case: modules, functions, methods, variables
- SCREAMING_SNAKE_CASE: constants, statics

#### Python

- PascalCase: Classes
- snake_case: functions, methods, variables, modules (files)
- SCREAMING_SNAKE_CASE: constants
- shortlowercase: packages (isn't necessary)

### 1.2 Git

#### Branches' names

- kebab-case: names of branches

#### Pull requests

- create pull requests after completing a task

#### Code Review

- Kuba - backend reviews
- Tomek - frontend reviews

### 1.3 Task manager

- _unknown_

#### Important commands

- cargo tauri dev (run the project)
- docker compose up -d (run the docker-compose.yml)
- docker compose watch (run the docker when you need the auto-update)
- docker ps -a (list of all containers)
- docker start **_id_of_container_** (run a container of certain **_id_**)
- docker stop **_id_of_container_** (stop a container of certain **_id_**)
- yarn install (install node modules)
