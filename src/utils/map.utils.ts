/**
 * Useful methods to interact with map structure
 */
export class MapUtils {
  
  /**
   * Look for a value in a map
   * @param map Map to look into
   * @param value Value to search
   * @returns the key associated to the found value
   */
  public static lookByValue<K,V>(map: Map<K,V>, value: V): K {
    
    for(let key of map.keys()) {
      if(value === map.get(key)) {
        return key;
      }
    }

    return null;
  }
}