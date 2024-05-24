This repo implements the system detailed in "Approaching Human-Level Forecasting
with Language Models" by Halawi et al, [pdf here](https://arxiv.org/pdf/2402.18563.pdf).

### Setup

Install dependencies.

```shell
yarn install
```

Add your API keys.

```
vim .env
```

### Usage

To make a prediction:

```
yarn predict questions/spacexMoonLanding.json
```
