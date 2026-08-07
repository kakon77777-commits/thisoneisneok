"""Run one corpus through one implementation and collect what happened."""


def run(module, corpus):
    values, errors = [], []
    for item in corpus:
        try:
            values.append(module.escape(item))
            errors.append(None)
        except Exception as exc:  # noqa: BLE001 - the class IS the observation
            values.append(None)
            errors.append((type(exc).__name__, str(exc)))
    return values, errors
