"""Verify stored published values; do not fetch or alter historical snapshots."""
import csv
import json
import re
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

HERE = Path(__file__).resolve().parent

def csv_rows(path):
    with path.open() as stream:
        return list(csv.DictReader(stream))


def normalize(name):
    return name.replace('(', '').replace(')', '').replace("Aug '25", 'Aug 2025').replace("Oct '25", 'Oct 2025').replace(',', '').lower().replace(' ', '')


current = {name: csv_rows(HERE / name) for name in ('speech-to-speech.csv', 'speech-agent-arena.csv')}
assert len(current['speech-to-speech.csv']) == 47
assert len(current['speech-agent-arena.csv']) == 30
raw = json.loads((HERE / 'source-tables.json').read_text())['tables']
assert len(current['speech-to-speech.csv']) == len(raw['aa'][-1]) - 1
for parsed, cells in zip(current['speech-to-speech.csv'], raw['aa'][-1][1:]):
    assert (parsed['provider'], parsed['model']) == tuple(cells[:2])
    for metric, cell in zip(('index', 'reasoning', 'dynamics', 'agentic', 'elo', 'success', 'ttfa', 'cost', 'input_price', 'output_price'), cells[2:]):
        assert parsed[metric] == ('' if cell == '-' else cell.strip('%$'))
assert len(current['speech-agent-arena.csv']) == len(raw['arena'][0]) - 1
for parsed, cells in zip(current['speech-agent-arena.csv'], raw['arena'][0][1:]):
    assert parsed['model'] == cells[2]
    assert parsed['elo'] == re.match(r'\d+', cells[3])[0]
    ci = re.search(r'interval (\d+) to (\d+)', cells[3])
    assert parsed['ci_low'] == (ci[1] if ci else '')
    assert parsed['ci_high'] == (ci[2] if ci else '')
    assert parsed['samples'] == cells[4]
    assert parsed['success'] == cells[5].strip('%')
    bounds = cells[6].split('/') if '/' in cells[6] else ('', '')
    assert (parsed['success_ci_low'], parsed['success_ci_high']) == tuple(v.strip('%') for v in bounds)
changes = csv_rows(HERE / 'changes.csv')
precision_differences = 0
for row in changes:
    if row['previous_snapshot']:
        previous = {normalize(r['model']): r for r in csv_rows(HERE / row['previous_snapshot'])}
        now = {normalize(r['model']): r for r in current[row['current_snapshot']]}
        assert previous[normalize(row['model'])][row['metric']] == row['previous_value']
        assert now[normalize(row['model'])][row['metric']] == row['current_value']
    if row['comparability'] == 'unchanged_public_value':
        a, b = Decimal(row['previous_value']), Decimal(row['current_value'])
        difference = b - a
        assert difference == Decimal(row['absolute_delta']) == 0
        assert row['numeric_direction'] == 'flat' and row['outcome'] == 'unchanged'
        if a:
            assert (b - a) / a * 100 == Decimal(row['relative_delta_percent'])
    else:
        assert not row['absolute_delta'] and not row['relative_delta_percent']
    if row['comparability'] == 'precision_mismatch':
        a, b = Decimal(row['previous_value']), Decimal(row['current_value'])
        assert a == b.quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        precision_differences += a != b
    if row['comparability'] == 'new_observation_no_prior_snapshot':
        candidates = json.loads((HERE / 'supplemental.json').read_text())
        matches = [r for r in candidates if r['model'] == row['model'] and r['metric'] == row['metric']]
        assert len(matches) == 1 and matches[0]['value'] == row['current_value']
        assert matches[0]['unit'] == row['unit']
    if row['metric'] in ('ttfa', 'cost', 'first_audio'):
        assert row['better_direction'] == 'lower'
assert precision_differences == 39
assert len(changes) == 448
print(json.dumps({'rows': len(changes), 'precision_differences': precision_differences, 'statuses': dict(Counter(r['comparability'] for r in changes))}, ensure_ascii=False))
