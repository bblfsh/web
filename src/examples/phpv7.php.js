export const php_example_2 = `<?php

declare(strict_types = 1);

interface Comparer {
    public function compare(int $a, int $b): string;
}

class BySize {
  	private $comparer;

  	public function getComparer(): Comparer {
  		return $this->comparer;
  	}

  	public function setComparer(Comparer $comparer) {
  		$this->comparer = $comparer;
  	}
}

$app = new BySize;
$app->setComparer(new class implements Comparer {
	public function compare(int $a, int $b): string {
		switch ($a <=> $b) {
            case -1: return 'smaller';
            case 0: return 'identical';
            case 1: return 'bigger';
        }
	}
});

$res = $app->getComparer()->compare(1, 2);
print($res);
`;
