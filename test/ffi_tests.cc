#include "node.h"

extern "C" int NODE_MODULE_EXPORT ExportedFunction(int value)
{
  return value * 2;
}