# AI Superforecaster

This repo implements the system detailed in [Approaching Human-Level Forecasting
with Language Models](https://arxiv.org/pdf/2402.18563) by Halawi et al.

It uses [large language models](https://en.wikipedia.org/wiki/Large_language_model)
to generate accurate forecasts for arbitrary Yes/No questions -- like those seen
on popular prediction markets such as
[Polymarket](https://polymarket.com),
[Metaculus](https://www.metaculus.com/home/), and
[Manifold](https://manifold.markets/).

Examples include:

* Will the price of Dogecoin exceed $0.50 USD during any 48h period before 2025?
* Will Carlos Alcaraz win the 2024 French Open?
* Will NVDA beat its consensus earnings forecast for Q3 2024?
* Will Joe Biden win the popular vote in the 2024 general election?

The system uses [retrieval augmented generation](https://en.wikipedia.org/wiki/Prompt_engineering#Retrieval-augmented_generation)
and hundreds of news articles obtained from the [NewsCatcher API](https://www.newscatcherapi.com/)
to research and answer each question it is provided.

It is the core of what powers the [Cassandra0racle](https://x.com/Cassandra0racle) Twitter account.

### Setup

Install dependencies:

```shell
yarn install
```

Get API keys for:

* [OpenAI](https://platform.openai.com/account/api-keys)
* [NewsCatcher](https://www.newscatcherapi.com/)

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

Question JSON files are expected to have the following properties:

* __question__: A yes/no question.
* __resolutionCriteria__: The exact conditions under which the answer to the question should be Yes vs No.
* __background__: Background information relevant to answering the question.
* __beginDate__: The start time of the forecasting period, formatted as an
  [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string.
* __closeDate__: The end time of the forecasting period, formatted as an
  [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string.
