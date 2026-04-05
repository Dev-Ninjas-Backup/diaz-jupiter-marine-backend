export enum EventsEnum {
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum QueueEventsEnum {
  NOTIFICATION = 'queue:notification',
  MESSAGES = 'queue:messages',
  LISTING_IMAGE_PROCESSING = 'queue:listing_image_processing',
  LISTING_IMAGE_DELETING = 'queue:listing_image_deleting',
  ADOPT_BOATS_SPECIFICATION = 'queue:adopt_boats_specification',
  ADOPT_BOATS_FEATURES = 'queue:adopt_boats_features',
  SYNC_BOATS_WITH_GMC = 'queue:sync_boats_with_gmc',
}
