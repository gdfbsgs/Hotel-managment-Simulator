import { Floor, TileType } from './types';

const charToTile: Record<string, TileType> = {
  ' ': 'empty',
  '.': 'floor',
  '#': 'wall',
  'D': 'door',
  'W': 'window',
  'B': 'bed',
  'b': 'bathroom',
  'R': 'reception',
  'S': 'staff',
  'P': 'plant',
  'T': 'table',
  'E': 'elevator',
  'X': 'stairs'
};

const GRID_SIZE = 20;

function parseGrid(ascii: string[]): TileType[][] {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('empty') as TileType[]);
  for (let y = 0; y < Math.min(GRID_SIZE, ascii.length); y++) {
    for (let x = 0; x < Math.min(GRID_SIZE, ascii[y].length); x++) {
      const char = ascii[y][x];
      grid[y][x] = charToTile[char] || 'empty';
    }
  }
  return grid;
}

export const PRESETS: Record<string, Floor[]> = {
  'small-hotel': [
    {
      level: 0,
      name: 'Ground Floor Lobby',
      grid: parseGrid([
        '####################',
        '#P........#P...P...#',
        '#.........#........#',
        '#...RRR...D........#',
        '#...RRR...#...TT...#',
        '#.........#...TT...#',
        '#.........#........#',
        '#####D#####........#',
        '#.........#........#',
        'W.........#...TT...#',
        'W.........#...TT...#',
        'W.........#........#',
        '#.........#........#',
        '#P........#P...P...#',
        '#########D##########',
        '      EE            ',
        '      EE            ',
      ]),
      labels: [
        { id: '1', x: 4, y: 3, text: 'Reception' },
        { id: '2', x: 14, y: 4, text: 'Cafe' },
        { id: '3', x: 4, y: 11, text: 'Lobby Lounge' },
      ]
    },
    {
      level: 1,
      name: 'Standard Rooms',
      grid: parseGrid([
        '####################',
        '#BB...#BB...#BB....#',
        '#BB...#BB...#BB....#',
        '#.....#.....#......#',
        'W.....W.....W......#',
        '###D#####D#####D####',
        '...................W',
        '...................W',
        '...................W',
        '###D#####D#####D####',
        '#.....#.....#......#',
        '#BB...#BB...#BB....#',
        '#BB...#BB...#BB....#',
        'W.....W.....W......#',
        '####################',
        '      EE            ',
        '      EE            ',
      ]),
      labels: [
        { id: '4', x: 2, y: 2, text: 'Room 101' },
        { id: '5', x: 8, y: 2, text: 'Room 102' },
        { id: '6', x: 14, y: 2, text: 'Room 103' },
        { id: '7', x: 2, y: 11, text: 'Room 104' },
        { id: '8', x: 8, y: 11, text: 'Room 105' },
        { id: '9', x: 14, y: 11, text: 'Room 106' },
      ]
    }
  ],
  'luxury-suite': [
    {
      level: 0,
      name: 'Penthouse Suite',
      grid: parseGrid([
        '####################',
        '#T.....#BBBB.......#',
        '#......#BBBB.......#',
        '#......D...........W',
        'W......#...........W',
        'W......#####D#######',
        '#......#...........#',
        '#......#...........#',
        '###D####...........#',
        '#......#...........#',
        '#......#.....P.....#',
        '#..TT..D...........W',
        '#..TT..#...........W',
        '#......#...........#',
        '####################',
        '      EE            ',
        '      EE            ',
      ]),
      labels: [
        { id: '10', x: 2, y: 2, text: 'Dining' },
        { id: '11', x: 14, y: 2, text: 'Master Bed' },
        { id: '12', x: 14, y: 9, text: 'Lounge' },
        { id: '13', x: 2, y: 11, text: 'Study' },
      ]
    }
  ],
  'auto-preset': [
    {
      level: 0,
      name: 'Ground Floor',
      grid: parseGrid([
        '####################',
        '#bBB##...EE...##BBb#',
        '#....#........#....#',
        '#....D........D....#',
        '######........######',
        '#bBB##........##SSS#',
        '#....#........#....#',
        '#....D........D....#',
        '######........######',
        '#TT.##...RR...##.TT#',
        '#...D....RR....D...#',
        '######........######',
        '#P................P#',
        '#W................W#',
        '#..................#',
        '#######DDDDDD#######',
      ]),
      labels: [
        { id: '1', x: 2, y: 2, text: 'Room 1' },
        { id: '2', x: 17, y: 2, text: 'Room 2' },
        { id: '3', x: 2, y: 6, text: 'Room 3' },
        { id: '4', x: 17, y: 6, text: 'Staff' },
        { id: '5', x: 2, y: 10, text: 'Management' },
        { id: '6', x: 10, y: 10, text: 'Reception' },
        { id: '7', x: 17, y: 10, text: 'Lounge' },
      ]
    }
  ],
  'radisson-blu-olimpiiskii': [
    {
      level: 1,
      name: 'Floor 1: Lobby & FireLake Restaurant',
      grid: parseGrid([
        '####################',
        '#P........#P...P...#',
        '#.........#........#',
        '#...RRR...D........#',
        '#...RRR...#...TT...#',
        '#.........#...TT...#',
        '#.........#........#',
        '#####D#####........#',
        '#.........#........#',
        'W.........#...TT...#',
        'W.........#...TT...#',
        'W.........#........#',
        '#.........#........#',
        '#P........#P...P...#',
        '#########D##########',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-1-1', x: 4, y: 3, text: 'Reception Desk' },
        { id: 'rad-1-2', x: 14, y: 4, text: 'FireLake Restaurant' },
        { id: 'rad-1-3', x: 9, y: 14, text: 'Grand Entrance' }
      ]
    },
    {
      level: 6,
      name: 'Floor 6: Technical Rooms & Offices',
      grid: parseGrid([
        '####################',
        '#b.S.S.b#P.S.S.P#S.#',
        '#.......#.......#..#',
        '#..TTT..D..TTT..D..#',
        'W.......#.......#..#',
        '###D#########D######',
        '...................W',
        '...................W',
        '...................W',
        '######D#########D###',
        '#b.S.S.b#P.S.S.P#S.#',
        '#.......#.......#..#',
        '#..TTT..D..TTT..D..#',
        'W.......#.......#..#',
        '#########D##########',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-6-1', x: 4, y: 3, text: 'Server Rooms & IT HQ' },
        { id: 'rad-6-2', x: 14, y: 3, text: 'Operations Offices' },
        { id: 'rad-6-3', x: 9, y: 12, text: 'Engineering Hub' }
      ]
    },
    {
      level: 12,
      name: 'Floor 12: Executive Conference Rooms',
      grid: parseGrid([
        '####################',
        '#P.TTT.P#P.TTT.P#P.#',
        '#.......#.......#..#',
        'W.......D.......D..W',
        'W.......#.......#..W',
        '###D#########D######',
        '...................W',
        '...................W',
        '...................W',
        '######D#########D###',
        '#P.TTT.P#P.TTT.P#P.#',
        '#.......#.......#..#',
        'W.......D.......D..W',
        'W.......#.......#..W',
        '#########D##########',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-12-1', x: 4, y: 3, text: 'Grand Boardroom A' },
        { id: 'rad-12-2', x: 14, y: 3, text: 'Meeting Room B' },
        { id: 'rad-12-3', x: 9, y: 12, text: 'Lobby & Pre-function' }
      ]
    },
    {
      level: 13,
      name: 'Floor 13: SPA The Elements & Gym',
      grid: parseGrid([
        '####################',
        '#P........#P...P...#',
        '#.........#........#',
        '#..bbbbb..D...TT...#',
        '#..bbbbb..#...TT...#',
        '#.........#........#',
        '#.........#........#',
        '#####D#####........#',
        '#.........#........#',
        'W..bbbbb..#...TT...#',
        'W..bbbbb..#...TT...#',
        'W.........#........#',
        '#.........#........#',
        '#P........#P...P...#',
        '#########D##########',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-13-1', x: 4, y: 4, text: 'SPA THE ELEMENTS' },
        { id: 'rad-13-2', x: 14, y: 4, text: 'Modern Gym Zone' },
        { id: 'rad-13-3', x: 4, y: 10, text: 'Hot Stone Sauna' }
      ]
    },
    {
      level: 15,
      name: 'Floor 15: Standard Panoramic Rooms',
      grid: parseGrid([
        '####################',
        '#bBB..#bBB..#bBB...#',
        '#.....#.....#......#',
        '#.....#.....#......#',
        'W.....W.....W......#',
        '###D#####D#####D####',
        '...................W',
        '...................W',
        '...................W',
        '###D#####D#####D####',
        '#.....#.....#......#',
        '#bBB..#bBB..#bBB...#',
        '#.....#.....#......#',
        'W.....W.....W......#',
        '####################',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-15-1', x: 2, y: 2, text: 'Standard Room 1501' },
        { id: 'rad-15-2', x: 8, y: 2, text: 'Standard Room 1502' },
        { id: 'rad-15-3', x: 14, y: 2, text: 'Standard Room 1503' },
        { id: 'rad-15-4', x: 2, y: 12, text: 'Standard Room 1504' },
        { id: 'rad-15-5', x: 8, y: 12, text: 'Standard Room 1505' },
        { id: 'rad-15-6', x: 14, y: 12, text: 'Standard Room 1506' }
      ]
    },
    {
      level: 18,
      name: 'Floor 18: High-Rise Standard Rooms',
      grid: parseGrid([
        '####################',
        '#bBB..#bBB..#bBB...#',
        '#..T..#..T..#..T...#',
        '#.....#.....#......#',
        'W.....W.....W......#',
        '###D#####D#####D####',
        '...................W',
        '...................W',
        '...................W',
        '###D#####D#####D####',
        '#.....#.....#......#',
        '#..T..#..T..#..T...#',
        '#bBB..#bBB..#bBB...#',
        'W.....W.....W......#',
        '####################',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-18-1', x: 2, y: 2, text: 'Standard Room 1801' },
        { id: 'rad-18-2', x: 8, y: 2, text: 'Standard Room 1802' },
        { id: 'rad-18-3', x: 14, y: 2, text: 'Standard Room 1803' },
        { id: 'rad-18-4', x: 2, y: 12, text: 'Standard Room 1804' },
        { id: 'rad-18-5', x: 8, y: 12, text: 'Standard Room 1805' },
        { id: 'rad-18-6', x: 14, y: 12, text: 'Standard Room 1806' }
      ]
    },
    {
      level: 22,
      name: 'Floor 22: Deluxe Panoramic Rooms',
      grid: parseGrid([
        '####################',
        '#bBB..#bBB..#bBB...#',
        '#..T..#..T..#..T...#',
        '#.....#.....#......#',
        'W..W..W..W..W..W...#',
        '###D#####D#####D####',
        '...................W',
        '...................W',
        '...................W',
        '###D#####D#####D####',
        '#.....#.....#......#',
        '#..T..#..T..#..T...#',
        '#bBB..#bBB..#bBB...#',
        'W..W..W..W..W..W...#',
        '####################',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-22-1', x: 2, y: 2, text: 'Standard Room 2201' },
        { id: 'rad-22-2', x: 8, y: 2, text: 'Standard Room 2202' },
        { id: 'rad-22-3', x: 14, y: 2, text: 'Standard Room 2203' },
        { id: 'rad-22-4', x: 2, y: 12, text: 'Standard Room 2204' },
        { id: 'rad-22-5', x: 8, y: 12, text: 'Standard Room 2205' },
        { id: 'rad-22-6', x: 14, y: 12, text: 'Standard Room 2206' }
      ]
    },
    {
      level: 24,
      name: 'Floor 24: Superior Business Suites',
      grid: parseGrid([
        '####################',
        '#bBBBB...#bBBBB....#',
        '#bBBBB...#bBBBB....#',
        '#....T...#....T....#',
        'W........W.........#',
        '###D##########D#####',
        '...................W',
        '...................W',
        '...................W',
        '###D##########D#####',
        '#........#.........#',
        '#....T...#....T....#',
        '#bBBBB...#bBBBB....#',
        'W........W.........#',
        '####################',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-24-1', x: 4, y: 2, text: 'Superior Suite 2401' },
        { id: 'rad-24-2', x: 14, y: 2, text: 'Superior Suite 2402' },
        { id: 'rad-24-3', x: 4, y: 12, text: 'Superior Suite 2403' },
        { id: 'rad-24-4', x: 14, y: 12, text: 'Superior Suite 2404' }
      ]
    },
    {
      level: 28,
      name: 'Floor 28: Superior Family Suites',
      grid: parseGrid([
        '####################',
        '#bBBBB...#bBBBB....#',
        '#bBBBB...#bBBBB....#',
        '#..T.T...#..T.T....#',
        'W........W.........#',
        '###D##########D#####',
        '...................W',
        '...................W',
        '...................W',
        '###D##########D#####',
        '#bBBBB...#bBBBB....#',
        '#bBBBB...#bBBBB....#',
        '#..T.T...#..T.T....#',
        'W........W.........#',
        '####################',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-28-1', x: 4, y: 2, text: 'Family Suite 2801' },
        { id: 'rad-28-2', x: 14, y: 2, text: 'Family Suite 2802' },
        { id: 'rad-28-3', x: 4, y: 12, text: 'Family Suite 2803' },
        { id: 'rad-28-4', x: 14, y: 12, text: 'Family Suite 2804' }
      ]
    },
    {
      level: 31,
      name: 'Floor 31: The Presidential Suite',
      grid: parseGrid([
        '####################',
        '#bBBBBBB...#P...P..#',
        '#bBBBBBB...#.......#',
        '#....TT....D..TT...W',
        'W..........#..TT...W',
        'W....P.....#.......#',
        '#####D######.......#',
        '#..........D.......W',
        '#..........#.......W',
        '#...SSSS...#..TT...#',
        '#...SSSS...#..TT...#',
        '#..........#.......#',
        '#..........#.......#',
        '#P........P#P....P.#',
        '####################',
        '      EE            ',
        '      EE            ',
        '                    ',
        '                    ',
        '                    '
      ]),
      labels: [
        { id: 'rad-31-1', x: 4, y: 3, text: 'Presidential Master Suite' },
        { id: 'rad-31-2', x: 14, y: 4, text: 'Panoramic Terrace' },
        { id: 'rad-31-3', x: 14, y: 10, text: 'Grand Private Bar' }
      ]
    }
  ]
};
