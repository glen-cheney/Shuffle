export interface DemoItem {
  id: string;
  title: string;
  url: string;
  groups: string[];
  dateCreated: string;
  image: string;
  imageSrcSet: string;
  alt: string;
  tags: string[];
  description?: string;
  display: {
    colXs: number;
    colSm: number;
    colMd: number;
    heightSpan2?: boolean;
    lockAspectRatio?: boolean;
    isOverlay?: boolean;
  };
}

export const DEMO_ITEMS: DemoItem[] = [
  {
    id: 'lake-walchen',
    title: 'Lake Walchen',
    url: 'https://unsplash.com/photos/zshyCr6HGw0',
    groups: ['nature'],
    dateCreated: '2017-04-30',
    image:
      'https://images.unsplash.com/photo-1493585552824-131927c85da2?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=6ef0f8984525fc4500d43ffa53fe8190',
    imageSrcSet:
      'https://images.unsplash.com/photo-1493585552824-131927c85da2?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=6ef0f8984525fc4500d43ffa53fe8190 1x, https://images.unsplash.com/photo-1493585552824-131927c85da2?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=6ef0f8984525fc4500d43ffa53fe8190 2x',
    alt: 'A deep blue lake sits in the middle of vast hills covered with evergreen trees',
    tags: ['nature'],
    display: { colXs: 3, colSm: 4, colMd: 3, lockAspectRatio: true },
  },
  {
    id: 'golden-gate-bridge',
    title: 'Golden Gate Bridge',
    url: 'https://unsplash.com/photos/RRNbMiPmTZY',
    groups: ['city'],
    dateCreated: '2016-07-01',
    image:
      'https://images.unsplash.com/photo-1467348733814-f93fc480bec6?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=2590c736835ec6555e952e19bb37f06e',
    imageSrcSet:
      'https://images.unsplash.com/photo-1467348733814-f93fc480bec6?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=2590c736835ec6555e952e19bb37f06e 1x, https://images.unsplash.com/photo-1467348733814-f93fc480bec6?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=2590c736835ec6555e952e19bb37f06e 2x',
    alt: 'Looking down over one of the pillars of the Golden Gate Bridge to the roadside and water below',
    tags: ['city'],
    display: { colXs: 3, colSm: 8, colMd: 6, isOverlay: true },
  },
  {
    id: 'crocodile',
    title: 'Crocodile',
    url: 'https://unsplash.com/photos/YOX8ZMTo7hk',
    groups: ['animal'],
    dateCreated: '2016-08-12',
    image:
      'https://images.unsplash.com/photo-1471005197911-88e9d4a7834d?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=bd8b952c4c983d4bde5e2018c90c9124',
    imageSrcSet:
      'https://images.unsplash.com/photo-1471005197911-88e9d4a7834d?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=bd8b952c4c983d4bde5e2018c90c9124 1x, https://images.unsplash.com/photo-1471005197911-88e9d4a7834d?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=bd8b952c4c983d4bde5e2018c90c9124 2x',
    alt: 'A close, profile view of a crocodile looking directly into the camera',
    tags: ['animal'],
    display: { colXs: 3, colSm: 4, colMd: 3, lockAspectRatio: true },
  },
  {
    id: 'spacex',
    title: 'SpaceX',
    url: 'https://unsplash.com/photos/GDdRP7U5ct0',
    groups: ['space'],
    dateCreated: '2016-03-07',
    image:
      'https://images.unsplash.com/photo-1457364559154-aa2644600ebb?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=3d0e3e8d72fc5667fd9fbe354e80957b',
    imageSrcSet:
      'https://images.unsplash.com/photo-1457364559154-aa2644600ebb?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=3d0e3e8d72fc5667fd9fbe354e80957b 1x, https://images.unsplash.com/photo-1457364559154-aa2644600ebb?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=3d0e3e8d72fc5667fd9fbe354e80957b 2x',
    alt: 'SpaceX launches a Falcon 9 rocket from Cape Canaveral Air Force Station',
    tags: ['space'],
    description: 'SpaceX launches a Falcon 9 rocket from Cape Canaveral Air Force Station',
    display: { colXs: 3, colSm: 4, colMd: 3, heightSpan2: true, lockAspectRatio: true },
  },
  {
    id: 'crossroads',
    title: 'Crossroads',
    url: 'https://unsplash.com/photos/7nrsVjvALnA',
    groups: ['city'],
    dateCreated: '2016-06-09',
    image:
      'https://images.unsplash.com/photo-1465447142348-e9952c393450?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=7d97e22d36a9a73beb639a936e6774e9',
    imageSrcSet:
      'https://images.unsplash.com/photo-1465447142348-e9952c393450?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=7d97e22d36a9a73beb639a936e6774e9 1x, https://images.unsplash.com/photo-1465447142348-e9952c393450?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=7d97e22d36a9a73beb639a936e6774e9 2x',
    alt: 'A multi-level highway stack interchange in Puxi, Shanghai',
    tags: ['city'],
    display: { colXs: 3, colSm: 4, colMd: 3, lockAspectRatio: true },
  },
  {
    id: 'milky-way',
    title: 'Milky Way',
    url: 'https://unsplash.com/photos/_4Ib-a8g9aA',
    groups: ['space', 'nature'],
    dateCreated: '2016-06-29',
    image:
      'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=e641d6b3c4c2c967e80e998d02a4d03b',
    imageSrcSet:
      'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=e641d6b3c4c2c967e80e998d02a4d03b 1x, https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=e641d6b3c4c2c967e80e998d02a4d03b 2x',
    alt: 'Dimly lit mountains give way to a starry night showing the Milky Way',
    tags: ['space', 'nature'],
    display: { colXs: 6, colSm: 8, colMd: 6, isOverlay: true },
  },
  {
    id: 'earth',
    title: 'Earth',
    url: 'https://unsplash.com/photos/yZygONrUBe8',
    groups: ['space'],
    dateCreated: '2015-11-06',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=f4856588634def31d5885dc396fe9a2e',
    imageSrcSet:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=f4856588634def31d5885dc396fe9a2e 1x, https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=f4856588634def31d5885dc396fe9a2e 2x',
    alt: 'NASA Satellite view of Earth',
    tags: ['space'],
    description: 'NASA Satellite view of Earth',
    display: { colXs: 6, colSm: 8, colMd: 6, heightSpan2: true, lockAspectRatio: true },
  },
  {
    id: 'turtle',
    title: 'Turtle',
    url: 'https://unsplash.com/photos/L-2p8fapOA8',
    groups: ['animal'],
    dateCreated: '2015-07-23',
    image:
      'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=bc4e1180b6b8789d38c614edc8d0dd01',
    imageSrcSet:
      'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=bc4e1180b6b8789d38c614edc8d0dd01 1x, https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=bc4e1180b6b8789d38c614edc8d0dd01 2x',
    alt: 'A close up of a turtle underwater',
    tags: ['animal'],
    description: 'A close up of a turtle underwater',
    display: { colXs: 3, colSm: 4, colMd: 3, heightSpan2: true, lockAspectRatio: true },
  },
  {
    id: 'stanley-park',
    title: 'Stanley Park',
    url: 'https://unsplash.com/photos/b-yEdfrvQ50',
    groups: ['nature'],
    dateCreated: '2014-10-12',
    image:
      'https://images.unsplash.com/uploads/1413142095961484763cf/d141726c?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=6141097da144d759176d77b4024c064b',
    imageSrcSet:
      'https://images.unsplash.com/uploads/1413142095961484763cf/d141726c?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=6141097da144d759176d77b4024c064b 1x, https://images.unsplash.com/uploads/1413142095961484763cf/d141726c?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=6141097da144d759176d77b4024c064b 2x',
    alt: 'Many trees stand alonside a hill which overlooks a pedestrian path, next to the ocean at Stanley Park in Vancouver, Canada',
    tags: ['nature'],
    display: { colXs: 3, colSm: 4, colMd: 3, lockAspectRatio: true },
  },
  {
    id: 'astronaut-cat',
    title: 'Astronaut Cat',
    url: 'https://unsplash.com/photos/FqkBXo2Nkq0',
    groups: ['animal'],
    dateCreated: '2017-01-12',
    image:
      'https://images.unsplash.com/photo-1484244233201-29892afe6a2c?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=98423596f72d9f0913a4d44f0580a34c',
    imageSrcSet:
      'https://images.unsplash.com/photo-1484244233201-29892afe6a2c?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=98423596f72d9f0913a4d44f0580a34c 1x, https://images.unsplash.com/photo-1484244233201-29892afe6a2c?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=98423596f72d9f0913a4d44f0580a34c 2x',
    alt: 'An intrigued cat sits in grass next to a flag planted in front of it with an astronaut space kitty sticker on beige fabric.',
    tags: ['animal'],
    display: { colXs: 3, colSm: 4, colMd: 3, lockAspectRatio: true },
  },
  {
    id: 'san-francisco',
    title: 'San Francisco',
    url: 'https://unsplash.com/photos/h3jarbNzlOg',
    groups: ['city'],
    dateCreated: '2017-01-19',
    image:
      'https://images.unsplash.com/photo-1484851050019-ca9daf7736fb?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=05325a7cc678f7f765cbbdcf7159ab89',
    imageSrcSet:
      'https://images.unsplash.com/photo-1484851050019-ca9daf7736fb?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=05325a7cc678f7f765cbbdcf7159ab89 1x, https://images.unsplash.com/photo-1484851050019-ca9daf7736fb?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=584&h=329&fit=crop&s=05325a7cc678f7f765cbbdcf7159ab89 2x',
    alt: "Pier 14 at night, looking towards downtown San Francisco's brightly lit buildings",
    tags: ['city'],
    display: { colXs: 3, colSm: 8, colMd: 6, isOverlay: true },
  },
  {
    id: 'central-park',
    title: 'Central Park',
    url: 'https://unsplash.com/photos/utwYoEu9SU8',
    groups: ['nature', 'city'],
    dateCreated: '2015-10-20',
    image:
      'https://images.unsplash.com/photo-1445346366695-5bf62de05412?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=1822bfd69c4021973a3d926e9294b70f',
    imageSrcSet:
      'https://images.unsplash.com/photo-1445346366695-5bf62de05412?ixlib=rb-0.3.5&auto=format&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=1822bfd69c4021973a3d926e9294b70f 1x, https://images.unsplash.com/photo-1445346366695-5bf62de05412?ixlib=rb-0.3.5&auto=format&q=55&fm=jpg&dpr=2&crop=entropy&cs=tinysrgb&w=284&h=160&fit=crop&s=1822bfd69c4021973a3d926e9294b70f 2x',
    alt: 'Looking down on central park and the surrounding builds from the Rockefellar Center',
    tags: ['nature', 'city'],
    display: { colXs: 3, colSm: 4, colMd: 3, lockAspectRatio: true },
  },
] as const;
