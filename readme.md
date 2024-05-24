This repo implements the system detailed in [Approaching Human-Level Forecasting
with Language Models](https://arxiv.org/pdf/2402.18563) by Halawi et al.

### Setup

Install dependencies:

```shell
yarn install
```

Add your API keys:

```
cp .env.example .env
vim .env
```

### Usage

To make a prediction:

```
yarn predict questions/spacexMoonLanding.json
```
