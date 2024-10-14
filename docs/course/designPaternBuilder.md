# Design Pattern Builder

**Qu'est que c'est ?**

C'est un modèle de conception utilisé pour simplifier la création d'objets complexes.

Au lieu de créer un objet en une seule étape (comme on le fait avec un constructeur classique), le Builder permet de créer un objet en plusieurs étapes, chacune représentant une partie de l'initialisation.

**Pourquoi ?**

L'objectif est de rendre la création d'objets complexes plus lisible et flexible, surtout lorsqu'ils nécessitent de nombreuses configurations ou options. Le Builder sépare la construction de l'objet de sa représentation, ce qui facilite sa modification sans altérer l'objet lui-même.

**Exemple :**

```ts
class Car {
  constructor(
    public engine: string,
    public wheels: number,
    public color: string
  ) {}
}

class CarBuilder {
  private engine: string = "Default Engine";
  private wheels: number = 4;
  private color: string = "White";

  setEngine(engine: string): CarBuilder {
    this.engine = engine;
    return this;
  }

  setWheels(wheels: number): CarBuilder {
    this.wheels = wheels;
    return this;
  }

  setColor(color: string): CarBuilder {
    this.color = color;
    return this;
  }

  build(): Car {
    return new Car(this.engine, this.wheels, this.color);
  }
}

// Utilisation du Builder
const myCar = new CarBuilder()
  .setEngine("V8")
  .setColor("Red")
  .build();

console.log(myCar); // Car { engine: 'V8', wheels: 4, color: 'Red' }
```

[Retour au Sommaire](./SUMMARY.md)